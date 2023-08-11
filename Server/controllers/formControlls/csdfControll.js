const { changeTemp } = require('../../emailTemplate');
const csdf_collection = require('../../models/csdf');
const sendMail = require('../../utils/sendMail');
require('dotenv').config();
// const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  const {
    courseEnrolledFile,
    prefix,
    firstName,
    middleName,
    lastName,
    dob,
    gender,
    mobCode,
    mobile,
    email,
    altEmail,
    emergencyContact,
    kin,
    employer,
    typeOfId,
    idNumber,
    buildingName,
    street,
    town,
    state,
    postCode,
    country,
    overSeasBuildingName,
    overSeasStreet,
    overSeasTown,
    overSeasState,
    overSeasPostCode,
    overSeasCountry,
  } = req.body.formData1;

  const {
    courseEnrolledFileNew,
    prefixNew,
    firstNameNew,
    middleNameNew,
    lastNameNew,
    dobNew,
    genderNew,
    mobCodeNew,
    mobileNew,
    emailNew,
    altEmailNew,
    emergencyContactNew,
    kinNew,
    employerNew,
    buildingNameNew,
    streetNew,
    townNew,
    stateNew,
    postCodeNew,
    countryNew,
    overSeasBuildingNameNew,
    overSeasStreetNew,
    overSeasTownNew,
    overSeasStateNew,
    overSeasPostCodeNew,
    overSeasCountryNew,
  } = req.body.formData2;

  const newcsdf = new csdf_collection({
    oldDetail: {
      courseEnrolledFile,
      name: {
        prefix,
        firstName,
        middleName,
        lastName,
      },
      dob,
      gender,
      mob: {
        mobCode,
        mobile,
      },
      email,
      altEmail,
      emergencyContact,
      kin,
      employer,
      address: {
        buildingName,
        street,
        town,
        state,
        postCode,
        country,
      },
      overSeasAddress: {
        overSeasBuildingName,
        overSeasStreet,
        overSeasTown,
        overSeasState,
        overSeasPostCode,
        overSeasCountry,
      },
    },
    newDetail: {
      courseEnrolledFileNew,
      name: {
        prefixNew,
        firstNameNew,
        middleNameNew,
        lastNameNew,
      },
      dobNew,
      genderNew,
      mob: {
        mobCodeNew,
        mobileNew,
      },
      emailNew,
      altEmailNew,
      emergencyContactNew,
      kinNew,
      employerNew,
      address: {
        buildingNameNew,
        streetNew,
        townNew,
        stateNew,
        postCodeNew,
        countryNew,
      },
      overSeasAddress: {
        overSeasBuildingNameNew,
        overSeasStreetNew,
        overSeasTownNew,
        overSeasStateNew,
        overSeasPostCodeNew,
        overSeasCountryNew,
      },
    },
    typeOfId,
    idNumber,
  });

  const obj = {
    oldDetail: {
      courseEnrolledFile,
      name: {
        prefix,
        firstName,
        middleName,
        lastName,
      },
      dob,
      gender,
      mob: {
        mobCode,
        mobile,
      },
      email,
      altEmail,
      emergencyContact,
      kin,
      employer,
      address: {
        buildingName,
        street,
        town,
        state,
        postCode,
        country,
      },
      overSeasAddress: {
        overSeasBuildingName,
        overSeasStreet,
        overSeasTown,
        overSeasState,
        overSeasPostCode,
        overSeasCountry,
      },
    },
    newDetail: {
      courseEnrolledFileNew,
      name: {
        prefixNew,
        firstNameNew,
        middleNameNew,
        lastNameNew,
      },
      dobNew,
      genderNew,
      mob: {
        mobCodeNew,
        mobileNew,
      },
      emailNew,
      altEmailNew,
      emergencyContactNew,
      kinNew,
      employerNew,
      address: {
        buildingNameNew,
        streetNew,
        townNew,
        stateNew,
        postCodeNew,
        countryNew,
      },
      overSeasAddress: {
        overSeasBuildingNameNew,
        overSeasStreetNew,
        overSeasTownNew,
        overSeasStateNew,
        overSeasPostCodeNew,
        overSeasCountryNew,
      },
    },
    typeOfId,
    idNumber,
  };

  csdf_collection
    .insertMany(newcsdf)
    .then(async (result) => {
      res.send({ Status: 'Success', result: result });
      // Generate PDF
      // const browser = await puppeteer.launch({
      //   headless: 'new',
      // });
      // const page = await browser.newPage();

      let contentHTML =
        '<div style="display:flex; justify-content:center; padding-top:10px;"><img src="https://digitalmarketingcompanybangalore.in/logo.png" width="200px" alt="Logo"/></div>';

      let link = process.env.CLOUDINARY_IMAGE_URL;

      function displayProperty(key, value, depth) {
        const indentation = '&nbsp;'.repeat(depth * 2);
        contentHTML += `${indentation}<p style="margin:0px;padding:0px;line-height:30px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong style="font-size:24px;line-height:1; padding-left:15px;">${key}:</strong> <span style="font-size:20px;">${value}</span></p>`;
      }

      function iterateObject(obj, depth) {
        for (let key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (
              typeof obj[key] === 'object' &&
              Object.keys(obj[key]).length > 0
            ) {
              contentHTML += `<strong style="font-size:24px;line-height:1; padding-left:15px;">${key}:</strong><br>`;
              iterateObject(obj[key], depth + 1);
            } else {
              displayProperty(key, obj[key], depth);
            }
          }
        }
      }

      iterateObject(obj, 0);

      // await page.setContent(contentHTML);

      // const pdfBuffer = await page.pdf();
      // await browser.close();

      const name = firstName + ' ' + lastName;
      const mobileNew = mobCode + ' ' + mobile;
      const options = {
        email: process.env.CHANGE_OF_DETAILS_MAIL,
        subject: 'New Change Of Student Details Form Received',
        html: changeTemp(
          'Change Of Student Details',
          courseEnrolledFile,
          name,
          email,
          mobileNew
        ),
        // pdfBuffer: pdfBuffer,
      };
      sendMail(options)
        .then((result2) => {})
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((e) => {
      console.log('Serverside error', e);
    });
};
