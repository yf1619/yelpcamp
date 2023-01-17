if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const cities = require('./cities');
const {descriptors, places} = require('./seedHelpers')
const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/yelp-camp').
  catch(error => handleError(error));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i = 0 ; i < 200 ; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random()*20) + 10;
        const location = `${cities[random1000].city}, ${cities[random1000].state}`
        const geoData = await geocoder.forwardGeocode({
          query: location,
          limit: 1
      }).send()
        const camp = new Campground({
            author:'63b7b8c0d4166478d590ba08', 
            // location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            location:location,
            geometry: {
              type: "Point",
              coordinates: [
                  cities[random1000].longitude,
                  cities[random1000].latitude,
              ]
          },
            images: [
              {
                url: 'https://res.cloudinary.com/ddjl9insx/image/upload/v1673408593/YelpCamp/jd0sro7ocbcbrqicb4gu.jpg',
                filename: 'YelpCamp/jd0sro7ocbcbrqicb4gu',
              },
              {
                url: 'https://res.cloudinary.com/ddjl9insx/image/upload/v1673408593/YelpCamp/rzj6tojygnspcayp431x.webp',
                filename: 'YelpCamp/rzj6tojygnspcayp431x',
              }
            ],
            description:'adadadaa',
            price
        })
        await camp.save();
    }
}

seedDB().then(() =>{
    mongoose.connection.close();
})