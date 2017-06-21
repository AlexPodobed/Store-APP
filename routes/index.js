const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');
const reviewController = require('../controllers/review.controller');
const { catchErrors } = require('../handlers/errorHandlers');


// P U B L I C
router.get('/', storeController.homePage);
router.post('/add',
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.createStore)
);
router.post('/add/:id', catchErrors(storeController.updateStore));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/page/:page', catchErrors(storeController.getStores));
router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));
router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));
router.get('/login', userController.loginForm);
router.get('/register', userController.registerForm);
router.get('/logout', authController.logout);
router.post('/register',
    userController.validateRegister,
    catchErrors(userController.register),
    authController.login
);
router.post('/account/reset/:token',
    authController.confirmPasswords,
    catchErrors(authController.update)
);
router.post('/login', authController.login);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.get('/map', storeController.mapPage);
router.get('/top', catchErrors(storeController.getTopStores));

// P R I V A T E
router.get('/add', authController.isLoggedIn, storeController.addStore);
router.get('/account', authController.isLoggedIn, authController.account);
router.get('/hearts', authController.isLoggedIn, catchErrors(storeController.getHearts));
router.post('/reviews/:id', authController.isLoggedIn, catchErrors(reviewController.addReview));


// A P I
router.get('/api/search', catchErrors(storeController.searchStores));
router.get('/api/stores/near', catchErrors(storeController.mapStores));
router.post('/api/stores/:id/heart', catchErrors(storeController.heartStore));

module.exports = router;
