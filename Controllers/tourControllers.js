const tourModel = require('./../Models/TourModel');
const ApiFeatures = require('./../Utils/ApiFeatures');

exports.Aliasing = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  next();
};

//ROUTE HANDLERS
exports.getAllTours = async (req, res) => {
  const featureObject = new ApiFeatures(tourModel.find(), req.query)
    .filter()
    .paginate()
    .fieldLimiting()
    .sort();

  const tourData = await featureObject.query;
  res.status(200).json({
    status: 'Success',
    size: tourData.size,
    data: {
      tourData,
    },
  });
};

exports.getParticularTour = (req, res) => {
  req.params.id;
  console.log(req.params.id);
  tourModel
    .findById(req.params.id)
    .then((data) => {
      res.status(200).json({
        data,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({
        status: 'fail',
        message: 'Improper request',
      });
    });
  // console.log(req.params);
  // let particularTour;
  // console.log(tourList);
  // particularTour = tourList.find((element) => element.id === req.params.id);
  // // for (const element of tourList) {
  //   if (element.id === req.params.id) {
  //     console.log(element.id);
  //     console.log(element);
  //     particularTour = element;
  //     break;
  //   }
  // }
};

exports.createNewTour = async (req, res) => {
  const contents = req.body;
  tourModel
    .create(contents)
    .then((data) => {
      res.status(200).json({
        status: 'Success',
        data: {
          data,
        },
      });
    })
    .catch((err) => {
      res.status(200).json({
        status: 'fail',
        message: 'Something went wrong',
      });
    });
  // try {
  //   const newTour = await tourModel.create(contents);
  //   res.status(200).json({
  //     status: 'Success',
  //     data: {
  //       newTour,
  //     },
  //   });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: 'Please Send proper data',
  //   });
  // }

  //see what it returns in async await is what it passes as the response data in
  //.then() alright
};

exports.updateTour = (req, res) => {
  tourModel
    .findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    .then((data) => {
      res.status(200).json({
        data,
      });
    })
    .catch((err) => {
      console.log('Err occured');
      console.log(err);
      res.status(400).json({
        err,
      });
    });
};

exports.deleteTour = (req, res) => {
  tourModel
    .findByIdAndDelete(req.params.id)
    .then((data) => {
      res.status(204).json({
        data: null,
      });
    })
    .catch((err) => {
      res.status(400).json({
        err,
      });
    });
};

exports.tourStats = async (req, res) => {
  try {
    const stats = await tourModel.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          numRatings: { $sum: '$ratingsQuantity' },
          numTours: { $sum: 1 },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      {
        $match: { _id: { $ne: 'easy' } },
      },
    ]);

    res.status(200).json({
      data: stats,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      data: err,
    });
  }
};
