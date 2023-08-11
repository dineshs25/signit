const { checkOutReq } = require('../../emailTemplate');
const rrf_collection = require('../../models/rrf');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const _ = require('lodash');
const sendMail = require('../../utils/sendMail');
// const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  const {
    courseName,
    courseStartDate,
    prefix,
    firstName,
    middleName,
    lastName,
    dob,
    gender,
    telCode,
    telephone,
    mobCode,
    mobile,
    email,
    altEmail,
    typeOfId,
    idNumber,
    buildingName,
    street,
    town,
    state,
    postCode,
    country,
    invoiceNumber,
    reason,
    bankName,
    accNumber,
    accName,
    bsb,
    bankAddress,
    swiftCode,
    bankDate,
    refundAmount,
    comments,
    refundMethod,
    position,
    printName,
    dateProcessed,
    refundRegister,
    logDate,
    loggedBy,
    formal,
    formalDate,
  } = req.body.formData;

  const { refundType, otherRefundInput, base64Images, arr } = req.body;

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
          folder: `signit/rrf/${foldername}/images`,
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
          folder: `signit/rrf/${foldername}/signature`,
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

    const upload2 = arr.map(image2);
    const arrayImages2 = [];

    Promise.all(upload)
      .then((result1) => {
        Promise.all(upload2)
          .then((result2) => {
            result1.map((val) => {
              arrayImages.push(val.public_id);
            });
            result2.map((val) => {
              arrayImages2.push(val.public_id);
            });
            try {
              const newrrf = new rrf_collection({
                courseName: courseName,
                courseStartDate: courseStartDate,
                name: {
                  prefix: prefix,
                  firstName: firstName,
                  middleName: middleName,
                  lastName: lastName,
                },
                dob: dob,
                gender: gender,
                tel: {
                  telCode: telCode,
                  telephone: telephone,
                },
                mob: {
                  mobCode: mobCode,
                  mobile: mobile,
                },
                email: email,
                altEmail: altEmail,
                typeOfId: typeOfId,
                idNumber: idNumber,
                address: {
                  buildingName: buildingName,
                  street: street,
                  town: town,
                  state: state,
                  postCode: postCode,
                  country: country,
                },
                invoiceNumber,
                reason,
                bankName,
                accNumber,
                accName,
                bsb,
                bankAddress,
                swiftCode,
                bankDate,
                refundAmount,
                comments,
                refundMethod,
                position,
                printName,
                dateProcessed,
                refundRegister,
                logDate,
                loggedBy,
                formal,
                formalDate,
                refundType,
                otherRefundInput,
                signatureImage: arrayImages,
                sign: arrayImages2,
              });
              const obj = {
                courseName: courseName,
                courseStartDate: courseStartDate,
                name: {
                  prefix: prefix,
                  firstName: firstName,
                  middleName: middleName,
                  lastName: lastName,
                },
                dob: dob,
                gender: gender,
                tel: {
                  telCode: telCode,
                  telephone: telephone,
                },
                mob: {
                  mobCode: mobCode,
                  mobile: mobile,
                },
                email: email,
                altEmail: altEmail,
                typeOfId: typeOfId,
                idNumber: idNumber,
                address: {
                  buildingName: buildingName,
                  street: street,
                  town: town,
                  state: state,
                  postCode: postCode,
                  country: country,
                },
                invoiceNumber,
                reason,
                'Supporting Documentation': arrayImages,
                bankName,
                accNumber,
                accName,
                bsb,
                bankAddress,
                swiftCode,
                bankDate,
                'Bank Signature': arrayImages2[0],
                refundAmount,
                comments,
                refundMethod,
                'Refund Signature': arrayImages2[1],
                position,
                printName,
                dateProcessed,
                refundRegister,
                logDate,
                loggedBy,
                'Logged By Signature': arrayImages2[2],
                formal,
                formalDate,
                refundType,
                otherRefundInput,
                // sign: arrayImages2,
              };
              rrf_collection
                .insertMany(newrrf)
                .then(async (result) => {
                  res.send({
                    Status: 'Success',
                    result: result,
                  });
                  // Generate PDF
                  // const browser = await puppeteer.launch({ headless: 'new' });
                  // const page = await browser.newPage();

                  let contentHTML =
                    '<div style="display:flex; justify-content:center; padding-top:10px;"><img src="https://digitalmarketingcompanybangalore.in/logo.png" width="200px" alt="Logo"/></div>';

                  let link = process.env.CLOUDINARY_IMAGE_URL;

                  for (let key in obj) {
                    if (obj.hasOwnProperty(key)) {
                      if (typeof obj[key] === 'object') {
                        console.log(`${key}:`);
                        contentHTML += `<strong style="font-size:24px;line-height:1; padding-left:15px;">${key}:</strong><br>`; // Use <br> for line breaks in HTML
                        for (let subKey in obj[key]) {
                          if (obj[key].hasOwnProperty(subKey)) {
                            if (
                              key === 'Bank Signature' ||
                              key === 'Refund Signature' ||
                              key === 'Logged By Signature' ||
                              key === 'Supporting Documentation'
                            ) {
                              console.log(obj[key][subKey], 'Hello');
                              contentHTML += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img style="padding-top:15px; padding-left:25px;" width="100px" src=${link}${obj[key][subKey]} alt="image"/><br>`;
                            } else {
                              if (key === 'unitCode' || key === 'unitTitle') {
                                console.log(obj[key][subKey]);
                                contentHTML += `<p style="margin:0px;padding:0px;font-size:20px;line-height:30px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${obj[key][subKey]}</p>`;
                              } else {
                                console.log(
                                  `  ${subKey}: ${obj[key][subKey]},Hello`
                                );
                                contentHTML += `<p style="margin:0px;padding:0px;font-size:20px;line-height:30px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${subKey}: ${obj[key][subKey]}</p>`;
                              }
                            }
                          }
                        }
                      } else {
                        if (
                          key === 'Bank Signature' ||
                          key === 'Refund Signature' ||
                          key === 'Logged By Signature'
                        ) {
                          console.log(`${key}: ${obj[key]}`, 'Hello');
                          contentHTML += `<p><strong style="font-size:24px;line-height:1; padding-left:15px;">${key}:</strong> <span style="font-size:20px;"><img width="100px" src=${link}${obj[key]} alt="image"/></span></p>`;
                        } else {
                          console.log(`${key}: ${obj[key]}`);
                          contentHTML += `<p><strong style="font-size:24px;line-height:1; padding-left:15px;">${key}:</strong> <span style="font-size:20px;">${obj[key]}</span></p>`;
                        }
                      }
                    }
                  }

                  // await page.setContent(contentHTML);

                  // const pdfBuffer = await page.pdf();
                  // await browser.close();

                  const newMobile = mobCode + ' ' + mobile;
                  const newName = firstName + ' ' + lastName;
                  const options = {
                    email: process.env.REFUND_MAIL,
                    subject: 'New Refund Request Form Received',
                    html: checkOutReq(
                      'Refund Request',
                      newName,
                      email,
                      newMobile,
                      country
                    ),
                    // pdfBuffer: pdfBuffer,
                  };

                  const options2 = {
                    email: email,
                    subject: 'Refund Request Form Submitted Successfully',
                    html: `<img src="https://digitalmarketingcompanybangalore.in/logo.png" width="200px" alt="Logo"/><br/><p><b>Dear ${newName}</b></p><br/>
<p>Thank You For Submitting Refund Request Form</p>
<p>Our Team Will Contact You</p><br/>
<p><b>Thank you</b></p>
<p><b>Signet institute</b></p>
<p>${process.env.REFUND_MAIL}</p>`,
                  };

                  sendMail(options)
                    .then((result2) => {
                      sendMail(options2)
                        .then((result3) => {})
                        .catch((e) => {
                          console.log(e);
                        });
                    })
                    .catch((e) => {
                      console.log(e);
                    });

                  // res.send({ Status: 'Success', result: result });
                })
                .catch((e) => {
                  console.log('Serverside error', e);
                });
            } catch (e) {
              console.log('Hello', e);
            }
          })
          .catch((e) => {
            console.log(e);
          });
      })
      .catch((e) => {
        console.log('promise error uploading images', e);
      });
  } catch (e) {
    console.log('server bycrpt catch error in client_post', e);
  }
};
