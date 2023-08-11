const { compalintTemp } = require('../../emailTemplate');
const cf_collection = require('../../models/cf');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const _ = require('lodash');
const sendMail = require('../../utils/sendMail');
// const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  const {
    studentNumber,
    mobileCode,
    mobile,
    surName,
    givenName,
    email,
    courseName,
    reason,
    outcome,
    date,
    receivedBy,
    receivedDate,
    ProcessedBy,
    ProcessedDate,
  } = req.body.formData;

  const { arr } = req.body;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDE_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const CapsName = studentNumber;

  const foldername = Date.now() + '-' + CapsName;

  try {
    let image = async (value) => {
      try {
        const response = await cloudinary.uploader.upload(value, {
          upload_preset: 'signit',
          folder: `signit/cf/${foldername}/signature`,
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

    const upload2 = arr.map(image);
    const arrayImages2 = [];

    Promise.all(upload2)
      .then((result2) => {
        result2.map((val) => {
          arrayImages2.push(val.public_id);
        });
        try {
          const newcf = new cf_collection({
            studentNumber,
            courseName,
            mob: {
              mobileCode,
              mobile,
            },
            name: {
              surName,
              givenName,
            },
            email,
            reason,
            outcome,
            date,
            receivedBy,
            receivedDate,
            ProcessedBy,
            ProcessedDate,
            sign: arrayImages2,
          });

          const obj = {
            studentNumber,
            courseName,
            mob: {
              mobileCode,
              mobile,
            },
            name: {
              surName,
              givenName,
            },
            email,
            'Reason for complaint': reason,
            'Outcome sought': outcome,
            sign: arrayImages2,
            date,
            receivedBy,
            receivedDate,
            ProcessedBy,
            ProcessedDate,
          };

          cf_collection
            .insertMany(newcf)
            .then(async (result) => {
              res.send({ Status: 'Success', result: result });
              // Generate PDF
              // const browser = await puppeteer.launch();
              // const page = await browser.newPage();

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
                          contentHTML += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img style="padding-top:15px; padding-left:25px;" width="100px" src=${link}${obj[key][subKey]} alt="image"/><br>`;
                        } else {
                          // console.log(`  ${subKey}: ${obj[key][subKey]}`);
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

              // await page.setContent(contentHTML);

              // const pdfBuffer = await page.pdf();
              // await browser.close();

              const mobileNum = mobileCode + ' ' + mobile;
              const options = {
                email: process.env.COMPLAINT_MAIL,
                subject: 'New Complaint Form Received',
                html: compalintTemp(
                  'Complaint',
                  studentNumber,
                  email,
                  mobileNum
                ),
                // pdfBuffer: pdfBuffer,
              };

              const options2 = {
                email: email,
                subject: 'Complaint Form Submitted Successfully',
                html: `<img src="https://digitalmarketingcompanybangalore.in/logo.png" width="200px" alt="Logo"/><br/><p><b>Dear Student</b></p><br/>
                <p>Thank You For Submitting Complaint Form</p>
                <p>Our Team Will Contact You</p><br/>
                <p><b>Thank you</b></p>
                <p><b>Signet institute</b></p>
                <p>${process.env.COMPLAINT_MAIL}</p>`,
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

              // res.send({ Status: 'Success', result: result });
            })
            .catch((e) => {
              console.log(e);
              res.send({ Status: 'Failed' });
            });
        } catch (e) {
          console.log(e);
          res.send({ Status: 'Failed' });
        }
      })
      .catch((e) => {
        console.log(e);
        res.send({ Status: 'Failed' });
      });
  } catch (e) {
    console.log(e);
    res.send({ Status: 'Failed' });
  }
};
