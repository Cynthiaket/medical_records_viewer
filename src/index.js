const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Medical Records Viewer listening on port ${PORT}`);
});
