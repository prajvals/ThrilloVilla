const tourModel = require('./../Models/TourModel');

exports.Aliasing = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  next();
};
//ROUTE HANDLERS
exports.getAllTours = async (req, res) => {
  console.log(req.query);
  //1. Creating the query object
  const queryObject = { ...req.query };
  const excludedFields = ['sort', 'page', 'limit', 'fields'];

  //2. Filtering for keywords
  excludedFields.forEach((el) => {
    delete queryObject[el];
  });

  //3. filtering for mongo keywords
  let queryString = JSON.stringify(queryObject);
  queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, (match) => {
    return `$${match}`;
  });

  //apprently we cannot store a promise in a variable
  let query = tourModel.find(JSON.parse(queryString));

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('duration');
  }

  //FEILD LIMITING
  if (req.query.fields) {
    const field = req.query.fields.split('.').join(' ');
    query = query.select(field);
  } else {
    query = query.select('-__v');
  }

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  console.log(skip);

  query = query.skip(skip).limit(limit);

  // only when we await do we say now go to background and do it
  const tourData = await query;
  res.status(200).json({
    status: 'Success',
    size: tourData.size,
    data: {
      tourData,
    },
  });
};
// tourModel.find((res) => {
//   res.status(200).json({
//     status: 'Success',
//     size: res.size,
//     data: res,
//   });
// });

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
