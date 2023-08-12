const { checkOutReq } = require('../../emailTemplate');
const cef_collection = require('../../models/cef');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const _ = require('lodash');
const sendMail = require('../../utils/sendMail');
const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  const {
    courseName,
    courseCode,
    qualCode,
    qualName,
    prefix,
    firstName,
    middleName,
    lastName,
    dob,
    mobCode,
    mobile,
    email,
    altEmail,
    buildingName,
    street,
    town,
    state,
    postCode,
    country,
    detail,
    date,
    reason,
    reasonsForReleaseRequest,
    intPrefix,
    intFirstName,
    intMiddleName,
    intLastName,
    intDate,
  } = req.body.formData;
  const { base64Images, base64Images1, intStudent, arr } = req.body;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDE_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const CapsName = _.capitalize(firstName);

  const foldername = Date.now() + '-' + CapsName;

  try {
    let image = async (value) => {
      try {
        const response = await cloudinary.uploader.upload(value, {
          upload_preset: 'signit',
          folder: `signit/cef/${foldername}/Image`,
          allowed_formats: [
            'png',
            'jpg',
            'jpeg',
            'svg',
            'webp',
            'ico',
            'jfif',
            'pdf',
          ],
        });
        return response;
      } catch (e) {
        console.log(e);
        return null;
      }
    };

    let image2 = async (value) => {
      try {
        const response = await cloudinary.uploader.upload(value, {
          upload_preset: 'signit',
          folder: `signit/cef/${foldername}/intImage`,
          allowed_formats: [
            'png',
            'jpg',
            'jpeg',
            'svg',
            'webp',
            'ico',
            'jfif',
            'pdf',
          ],
        });
        return response;
      } catch (e) {
        console.log(e);
        return null;
      }
    };

    let image3 = async (value) => {
      try {
        const response = await cloudinary.uploader.upload(value, {
          upload_preset: 'signit',
          folder: `signit/cef/${foldername}/signature`,
          allowed_formats: [
            'png',
            'jpg',
            'jpeg',
            'svg',
            'webp',
            'ico',
            'jfif',
            'pdf',
          ],
        });
        return response;
      } catch (e) {
        console.log(e);
        return null;
      }
    };

    const upload = base64Images.map(image);
    const arrayImages = [];

    const upload2 = base64Images1.map(image2);
    const arrayImages2 = [];

    const upload3 = arr.map(image3);
    const arrayImages3 = [];

    Promise.all(upload)
      .then((result1) => {
        Promise.all(upload2)
          .then((result2) => {
            Promise.all(upload3)
              .then((result3) => {
                result1.map((val) => {
                  arrayImages.push(val.public_id);
                });
                result2.map((val) => {
                  arrayImages2.push(val.public_id);
                });
                result3.map((val) => {
                  arrayImages3.push(val.public_id);
                });
                try {
                  const newcef = new cef_collection({
                    courseName: courseName,
                    courseCode,
                    qualCode,
                    qualName,
                    detail,
                    date,
                    reason,
                    intStudent,
                    name: {
                      prefix: prefix,
                      firstName: firstName,
                      middleName: middleName,
                      lastName: lastName,
                    },
                    image: arrayImages,
                    dob: dob,
                    mob: {
                      mobCode: mobCode,
                      mobile: mobile,
                    },
                    email: email,
                    altEmail: altEmail,
                    address: {
                      buildingName: buildingName,
                      street: street,
                      town: town,
                      state: state,
                      postCode: postCode,
                      country: country,
                    },
                    reasonsForReleaseRequest,
                    intPrefix,
                    intFirstName,
                    intMiddleName,
                    intLastName,
                    intDate,
                    image2: arrayImages2,
                    sign: arrayImages3,
                  });

                  const obj = {
                    name: {
                      prefix: prefix,
                      firstName: firstName,
                      middleName: middleName,
                      lastName: lastName,
                    },
                    dob: dob,
                    mob: {
                      mobCode: mobCode,
                      mobile: mobile,
                    },
                    email: email,
                    altEmail: altEmail,
                    address: {
                      buildingName: buildingName,
                      street: street,
                      town: town,
                      state: state,
                      postCode: postCode,
                      country: country,
                    },
                    courseName: courseName,
                    courseCode,
                    qualCode,
                    qualName,
                    'Details when to cancel enrolment': detail,
                    'Date effective from': date,
                    'Reasons for request': reason,
                    'Supporting Documents': arrayImages,
                    intStudent,
                    'Reasons for Release Request': reasonsForReleaseRequest,
                    'Int Supporting Documents': arrayImages2,
                    intPrefix,
                    intFirstName,
                    intMiddleName,
                    intLastName,
                    sign: arrayImages3,
                    Date: intDate,
                  };

                  cef_collection
                    .insertMany(newcef)
                    .then(async (result) => {
                      res.send({ Status: 'Success', result: result });

                      // Generate PDF
                      const browser = await puppeteer.launch({
                        headless: 'new',
                      });
                      const page = await browser.newPage();

                      let contentHTML =
                        '<div style="display:flex; justify-content:center; padding-top:10px;"><img src="https://digitalmarketingcompanybangalore.in/logo.png" width="200px" alt="Logo"/></div>';

                      let link = process.env.CLOUDINARY_IMAGE_URL;

                      for (let key in obj) {
                        if (obj.hasOwnProperty(key)) {
                          if (typeof obj[key] === 'object') {
                            // console.log(`${key}:`);
                            contentHTML += `<strong style="font-size:24px;line-height:1; padding-left:15px;">${key}:</strong><br>`; // Use <br> for line breaks in HTML
                            for (let subKey in obj[key]) {
                              if (obj[key].hasOwnProperty(subKey)) {
                                if (
                                  key === 'Supporting Documents' ||
                                  key === 'Int Supporting Documents' ||
                                  key === 'sign'
                                ) {
                                  // console.log(obj[key][subKey], 'Hello');
                                  contentHTML += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img style="padding-top:15px; padding-left:25px;"  width="100px" src=${link}${obj[key][subKey]} alt="image"/><br>`;
                                } else {
                                  // console.log(
                                  //   `  ${subKey}: ${obj[key][subKey]}`
                                  // );
                                  contentHTML += `<p style="margin:0px;padding:0px;font-size:20px;line-height:30px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${subKey}: ${obj[key][subKey]}</p>`;
                                }
                              }
                            }
                          } else {
                            // console.log(`${key}: ${obj[key]}`);
                            contentHTML += `<p><strong style="font-size:24px;line-height:1; padding-left:15px;">${key}:</strong> <span style="font-size:20px;">${obj[key]}</span></p>`;
                          }
                        }
                      }

                      await page.setContent(contentHTML);

                      const pdfBuffer = await page.pdf();
                      await browser.close();

                      const name = firstName + ' ' + lastName;
                      const options = {
                        email: process.env.CANCEL_ENROLLMENT_MAIL,
                        subject:
                          'New Application To Cancel Enrollement Form Received',
                        html: checkOutReq(
                          'Application To Cancel Enrollement',
                          name,
                          email,
                          mobile,
                          country
                        ),
                        pdfBuffer: pdfBuffer,
                      };

                      const options2 = {
                        email: email,
                        subject:
                          'Application To Cancel Enrollement Form Submitted Successfully',
                        html: `<img src="https://digitalmarketingcompanybangalore.in/logo.png" width="200px" alt="Logo"/><br/><p><b>Dear ${name}</b></p><br/>
                        <p>Thank You For Submitting Application To Cancel Enrollement Form</p>
                        <p>Our Team Will Contact You</p><br/>
                        <p><b>Thank you</b></p>
                        <p><b>Signet institute</b></p>
                        <p>${process.env.CANCEL_ENROLLMENT_MAIL}</p>`,
                      };

                      sendMail(options)
                        .then((result2) => {
                          sendMail(options2)
                            .then((result3) => {})
                            .catch((e) => {
                              console.log(e);
                            });
                        })
                        .catch((error) => {
                          console.log(error);
                        });
                    })
                    .catch((e) => {
                      res.send({ Status: 'Failed' });
                    });
                } catch (e) {
                  res.send({ Status: 'Failed' });
                }
              })
              .catch((e) => {
                res.send({ Status: 'Failed' });
              });
          })
          .catch((e) => {
            res.send({ Status: 'Failed' });
          });
      })
      .catch((e) => {
        res.send({ Status: 'Failed' });
      });
  } catch (e) {
    res.send({ Status: 'Failed' });
  }
};
