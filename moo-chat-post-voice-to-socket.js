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
  let bucketName = event.Records[0].s3.bucket.name;
  let fileName = event.Records[0].s3.object.key;
  let audioFile = await getAudio({ Bucket: bucketName, Key: fileName });
  let id = fileName.split('.')[0];
  const sessionId = id.split('-')[0]

  
  var data = {
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
  return req({
    method: 'POST',
    url: SOCKET_SERVER,
    formData: data
  })
};
