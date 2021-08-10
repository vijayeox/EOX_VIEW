import axios from "axios";

export default function apiForCount(fieldName) {
  // console.log(fieldName)
  var Count = 0;
  axios
    .get(
      'https://qa3.eoxvantage.com:9080/app/454a1ec4-eeab-4dc2-8a3f-6a4255ffaee1/file/search?filter=[{"filter":{"logic":"and","filters":[{"field":"status","operator":"eq","value": "' +
        fieldName +
        '"}]}}]',
      {
        headers: {
          authorization:
            "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE2MjM4MjIzOTQsImp0aSI6ImRucTF5aHhLWjFxXC9MV3NYUE9QWkxEcUozenFyMFlZcm1oWXpLXC9jY2grMD0iLCJuYmYiOjE2MjM4MjIzOTQsImV4cCI6MTYyMzg5NDM5NCwiZGF0YSI6eyJ1c2VybmFtZSI6InRlc3RzYWxlcyIsImFjY291bnRJZCI6IjMifX0.2ww1T7X9X_MW9IhezVNPxJhCMcZG61RZmIZNqmH8gymj5UMbrvRK27kOD4wmNae1OW0X0OYNuzIBFwJxCR46qw",
        },
      }
    )
    .then(res => {
      Count = res.data.total;
    })
    .catch(error => {
      console.log(error);
    });

  console.log(Count);
  return Count
}
