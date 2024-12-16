const request = require('supertest');
const app = require('./app');
const Favorite = require('./models/favorite');

it('should post a Favorite in bookmark', async () => {


  Favorite.prototype.save({
    _id: 'idCreation',
    name: 'Test Name',
    uri: 'http://example.com',
    city: 'Test City',
  });


  const res = await request(app)
    .post('/map/canBookmark')
    .send({
      name: 'placeName',
      uri: 'http://example.com',
      city: 'cityName',
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
  expect(res.body).toEqual(
    expect.objectContaining({
      result: true,
      newFavorite: expect.objectContaining({
        _id: 'idCreation',
        name: 'placeName',
        uri: 'http://example.com',
        city: 'cityName',
      }),
    })
  );
});
