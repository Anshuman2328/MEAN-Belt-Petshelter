let express     = require('express'),
    app         = express(),
    mongoose    = require('mongoose'),
    path        = require('path'),
    session     = require('express-session'),
    body_parser = require('body-parser');
    bcrypt      = require('bcryptjs');
    var mysort = {type:1}

app.use(body_parser.json());
app.use(express.static( __dirname + '/client/dist/client' ));
app.use(express.static(path.join(__dirname, "static")));
app.use(session({
    secret: '^P%mUWCwF4hWAhtgUb8BrRqWPuR$%4w^@FSB3j*VfumMEJB8SPpr57%aqRmsEyHGhJKcvgu9#W&5ZvUrCZ*q4c%8^A9RJ49@Mf3X',
    proxy: true,
    resave: false,
    saveUninitialized: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost/newpetsshelter');
mongoose.Promise = global.Promise;

let Schema = mongoose.Schema;

let RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter Pet Name'],
    minlength: [3, 'Pet Name has to be at least three characters long'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please enter Pet Type'],
    minlength: [3, 'Pet Type has to be at least three characters long'],
    trim: true
  },
  desc: {
    type: String,
    required: [true, 'Please enter description'],
    minlength: [3, 'Description Type has to be at least three characters long'],
    trim: true
  },
  one: {
    type: String,
    // required: [true, 'Please enter Pet Type'],
    // minlength: [3, 'Restuarant Type has to be at least three characters long'],
    // trim: true
  },
  two: {
    type: String,
    // required: [true, 'Please enter Pet Type'],
    // minlength: [3, 'Restuarant Type has to be at least three characters long'],
    // trim: true
  },
  three: {
    type: String,
    // required: [true, 'Please enter Pet Type'],
    // minlength: [3, 'Restuarant Type has to be at least three characters long'],
    // trim: true
  },


  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }]
}, {timestamps: true})

let ReviewSchema = new mongoose.Schema({
  _restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  name: {
    type: String,
    required: [true, 'Please enter name'],
    minlength: [3, 'Name should be at least three characters long'],
    trim: true
  },
  star: {
    type: Number,
    default: 1,
    min: [1, 'Every Pet deserves at Millions Stars only animal haters give them least one star'],
    // max: [5, 'Unfortunately, we cannot give a restaurant more than five stars']
  },
  content: {
    type: String,
    required: [true, 'Please enter review'],
    minlength: [3, 'Review should be at least three characters long'],
    trim: true
  }
}, {timestamps: true})

mongoose.model('Restaurant', RestaurantSchema);
mongoose.model('Review', ReviewSchema);

let Restaurant = mongoose.model('Restaurant');
let Review = mongoose.model('Review');

app.get('/restaurants', (req, res) => {
  let restaurants = Restaurant.find({}, (err, restaurants) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.json({message: 'Success', data: restaurants});
    }
  })
})

app.get('/restaurants/:id', (req, res) => {
  Restaurant.findOne({_id: req.params.id})
  .populate({path: 'reviews', options: {sort:{"star": "descending"}}})
  .exec( (err, restaurant) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.json({message: 'Success', data: restaurant});
    }
  })
})

app.post('/restaurants/:id', (req, res) => {
  Restaurant.findOne({_id: req.params.id}, (err, restaurant) => {
    const review = new Review(req.body);
    review._restaurant = restaurant._id;
    restaurant.reviews.push(review);
    review.save( (error) => {
      restaurant.save( (e) => {
        if (error) {
          res.status(400).json(error);
        } else {
          res.json({message: 'Success', data: review});
        }
      })
    })
  })
})

app.post('/restaurants', (req, res) => {
  const restaurant = new Restaurant(req.body);

  Restaurant.findOne({name: req.body.name}, (error, response) => {
    if (response) {
      res.status(400).json({message: 'Pet with that name already exists'});
    } else {
      restaurant.save((err) => {
        if (err) {
          res.status(400).json(err);
        } else {
          res.json({message: 'Success', data: restaurant});
        }
      })
    }
  })
})

app.put('/restaurants/:id', (req, res) => {
  const restaurant = Restaurant.findOne({_id: req.params.id}, (err, restaurant) => {
    if (err) {
      res.status(400).json(err);
    } else {
      restaurant.name = req.body.name;
      restaurant.type = req.body.type;
      restaurant.desc = req.body.desc;
      restaurant.one = req.body.one;
      restaurant.two = req.body.two;
      restaurant.three = req.body.three;

      restaurant.save( (error) => {
        if (error) {
          res.status(400).json(error);
        } else {
          res.json({message: 'Success', data: restaurant});
        }
      })
    }
  })
})

app.put('/reviews/:id', (req, res) => {
  const review = Review.findOne({_id: req.params.id}, (err, review) => {
    if (err) {
      res.status(400).json(err);
    } else {
      review.name = req.body.name;
      review.content = req.body.content;
      review.star = req.body.star;
      review.save( (error) => {
        if (error) {
          res.status(400).json(error);
        } else {
          res.json({message: 'Success', data: review});
        }
      })
    }
  })
})

app.delete('/restaurants/:id', (req, res) => {
  Restaurant.remove({_id: req.params.id}, (err) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.json({message: 'Successfully deleted'});
    }
  })
})

app.delete('/reviews/:id', (req, res) => {
  Review.remove({_id: req.params.id}, (err) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.json({message: 'Successfully deleted'});
    }
  })
})

app.all('*', (req, res, next) => {
  res.sendFile(path.resolve('./client/dist/client/index.html'));
})

// Other routes

let server = app.listen(8000, () => {
    console.log("listening on port 8000");
});