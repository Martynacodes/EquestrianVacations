const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Horsecamp = require('../models/horsecamp');

mongoose.connect('mongodb://localhost:27017/equestrian-vacations', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Horsecamp.deleteMany({});
    for (let i = 0; i < 350; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 500) + 10;
        const horse = new Horsecamp({
            // YOUR USER ID
            author: '61acddab8caa77d67fe7a2c3',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Molestiae fuga maiores beatae perferendis repellendus minus, numquam laboriosam nesciunt facilis adipisci corrupti, cupiditate, rerum repudiandae doloribus! Ullam laborum eum et! Nobis!',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/dwekn0hi2/image/upload/v1639061428/EquestrianVacations/foz1yhecveoayp779yag.jpg',
                    filename: 'EquestrianVacations/foz1yhecveoayp779yag'
                },
                {
                    url: 'https://res.cloudinary.com/dwekn0hi2/image/upload/v1639061428/EquestrianVacations/rft5mmkdvwnb0frkkwiz.jpg',
                    filename: 'EquestrianVacations/rft5mmkdvwnb0frkkwiz'
                }
            ]
        })
        await horse.save();
    }
}


seedDB().then(() => {
    mongoose.connection.close();
})