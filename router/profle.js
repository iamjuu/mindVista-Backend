const express = require('express')
const router  = express.Router()
const Profile = require('../controller/profile')

router.get('/profile',Profile.profileGet)
router.put('/update-profile',Profile.profileUpdate)

module.exports = router


