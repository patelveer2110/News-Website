import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  try {
    if (!to || !subject || !html) {
      throw new Error("Missing required email parameters: to, subject, or html");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log(`Creating transporter for ${process.env.EMAIL_USER}`);
    console.log(`Using service: ${transporter.options.service}`);
    console.log(`Using auth user: ${transporter.options.auth.user}`);
    console.log(`Using auth pass: ${transporter.options.auth.pass ? "******" : "not set"}`);
    
    

    const mailOptions = {
      from: `News App <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    console.log(`Sending email to ${to} with subject "${subject}"`);

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);

    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error; // re-throw to be caught by outer handler
  }
};
