const AWS = require('aws-sdk');
const req = require('request');

const s3 = new AWS.S3();

const SOCKET_SERVER = 'https://socket.moochat.awesomepossum.dev:80/senddata'

async function getAudio(params) {
  try {
    const audio = await s3.getObject(params).promise();
    return audio.Body
  } catch (ex) {
    console.error(ex)
    return null
  }
}

exports.handler = async (event) => {
  const bucketName = event.Records[0].s3.bucket.name;
  const fileName = event.Records[0].s3.object.key;
  const audioFile = await getAudio({ Bucket: bucketName, Key: fileName });
  const id = fileName.split('.')[0];
  const sessionId = id.split('-')[0]

  
  const data = {
    'sessionId': sessionId,
    'somefile': {
      value: audioFile,
      options: {
        contentType: 'audio/mp3',
        filename: fileName
      }
    }
  }

  console.log(data)
  await req({
    method: 'POST',
    url: SOCKET_SERVER,
    formData: data
  })
};
