const app = module.exports = require('express')()
app.port = 9001
app.origin = 'http://localhost:9001'

app.get(['/status/:status', '/status/:status/:message'], (req, res) => {
  if (req.params.status === 'close') {
    return req.destroy()
  }
  if (req.params.status === '301') {
    return res.redirect('/redirect')
  }
  res.status(+req.params.status)
    .set('x-message', req.params.message)
    .send({
      message: req.params.message,
      data: {
        greet: 'Hello World!'
      }
    })
})

app.listen(app.port)
