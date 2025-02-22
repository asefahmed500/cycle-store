import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendOrderConfirmationEmail(to: string, orderId: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: `Order Confirmation - Order #${orderId}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Your order #${orderId} has been confirmed and is being processed.</p>
      <p>You can check the status of your order in your account dashboard.</p>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export async function sendOrderStatusUpdateEmail(to: string, orderId: string, status: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: `Order Status Update - Order #${orderId}`,
    html: `
      <h1>Your order status has been updated</h1>
      <p>The status of your order #${orderId} has been updated to: ${status}</p>
      <p>You can check the details of your order in your account dashboard.</p>
    `,
  }

  await transporter.sendMail(mailOptions)
}

