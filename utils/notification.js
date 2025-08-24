const twilio = require('twilio');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
require("dotenv").config();
require("dotenv").config({ path: require("path").join(__dirname, ".env") });




const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  }
});

const userEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 0;">
  <table align="center" width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
    <tr>
      <td style="background: #4CAF50; padding: 20px; text-align: center; color: #ffffff; font-size: 22px; font-weight: bold;">
        Order Confirmation
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; color: #333;">
        <p>Hi <b>{{customerName}}</b>,</p>
        <p>Thank you for your generous donation! We're happy to let you know that we've received your order.</p>

        <h3 style="margin-top: 20px;">Order Details</h3>
        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
          <tr style="background-color: #f1f1f1;">
            <th align="left">Product</th>
            <th align="center">Quantity</th>
            <th align="right">Amount Donated</th>
          </tr>
          <tr>
            <td>{{productName}}</td>
            <td align="center">{{quantity}}</td>
            <td align="right">₹{{amount}}</td>
          </tr>
          <tr style="border-top: 2px solid #ddd; font-weight: bold;">
            <td colspan="2" align="right">Total Donation</td>
            <td align="right">₹{{amount}}</td>
          </tr>
        </table>

        <h3 style="margin-top: 20px;">Charity Information</h3>
        <p><strong>Charity Name:</strong> {{charityName}}</p>
        <p><strong>Your Contribution:</strong> ₹{{amount}} will help support this cause</p>

        <p style="margin-top: 30px;">Thank you for making a difference!</p>
        <p>For any questions, contact us at <a href="mailto:support@charitycommerce.com">support@charitycommerce.com</a>.</p>
      </td>
    </tr>
    <tr>
      <td style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #666;">
        © 2025 Charity Commerce. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
`;

const charityEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Order Received</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 0;">
  <table align="center" width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
    <tr>
      <td style="background: #2196F3; padding: 20px; text-align: center; color: #ffffff; font-size: 22px; font-weight: bold;">
        New Order Received
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; color: #333;">
        <p>Hello <b>{{charityOwnerName}}</b>,</p>
        <p>Great news! You have received a new order for your charity <b>{{charityName}}</b>.</p>

        <h3 style="margin-top: 20px;">Order Details</h3>
        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
          <tr style="background-color: #f1f1f1;">
            <th align="left">Product</th>
            <th align="center">Quantity</th>
            <th align="right">Amount</th>
          </tr>
          <tr>
            <td>{{productName}}</td>
            <td align="center">{{quantity}}</td>
            <td align="right">₹{{amount}}</td>
          </tr>
          <tr style="border-top: 2px solid #ddd; font-weight: bold;">
            <td colspan="2" align="right">Total Amount</td>
            <td align="right">₹{{amount}}</td>
          </tr>
        </table>

        <h3 style="margin-top: 20px;">Customer Information</h3>
        <p><strong>Customer Name:</strong> {{customerName}}</p>
        <p><strong>Customer Email:</strong> {{customerEmail}}</p>
        <p><strong>Order Date:</strong> {{orderDate}}</p>

        <p style="margin-top: 30px;">Please prepare the order for processing.</p>
        <p>For any questions, contact us at <a href="mailto:support@charitycommerce.com">support@charitycommerce.com</a>.</p>
      </td>
    </tr>
    <tr>
      <td style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #666;">
        © 2025 Charity Commerce. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
`;


const userTemplate = handlebars.compile(userEmailTemplate);
const charityTemplate = handlebars.compile(charityEmailTemplate);


async function sendSMS(phoneNumber, message) {
  try {
    if (!phoneNumber.startsWith("+")) {
      throw new Error("Phone number must be in E.164 format (e.g. +919902304316)");
    }

    const sms = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log(`✅ SMS sent to ${phoneNumber} (SID: ${sms.sid})`);
    return sms;
  } catch (error) {
    console.error("❌ SMS sending failed:", error.message);
    throw error;
  }
}

async function sendEmail(to, subject, html) {

  console.log("EMAIL_PASS present? =", !!(process.env.EMAIL_PASS && process.env.EMAIL_PASS.trim()));

  try {
    const info = await transporter.sendMail({
      from: `"Charity Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to} (Message ID: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }
}


async function sendOrderNotifications(user, charityOwner, product, order, quantity) {
  try {

    const userSMS = `Thank you for your order! Product: ${product.title}, Quantity: ${quantity}, Charity: ${product.charity_id.name}, Amount: ₹${order.amount}. Your support makes a difference!`;
    console.log(user.mobile)
    await sendSMS(user.mobile, userSMS);

    const userEmailHtml = userTemplate({
      customerName: user.name,
      productName: product.title,
      quantity: quantity,
      amount: order.amount,
      charityName: product.charity_id.name
    });

    await sendEmail(user.email, "Order Confirmation - Thank You for Your Donation", userEmailHtml);


    const charityEmailHtml = charityTemplate({
      charityOwnerName: charityOwner.name,
      charityName: product.charity_id.name,
      productName: product.title,
      quantity: quantity,
      amount: order.amount,
      customerName: user.name,
      customerEmail: user.email,
      orderDate: new Date().toLocaleDateString()
    });
    await sendEmail(charityOwner.email, "New Order Received for Your Charity", charityEmailHtml);
  } catch (error) {
    console.error("Notification error:", error);
  }
}

module.exports = { sendSMS, sendEmail, sendOrderNotifications };

