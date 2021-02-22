// const sendgridAPIkey = require('sendgrid');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'paulinaokulska@gmail.com', //normally your own domain
        subject: 'Welcome to the task manager application Taskatto!',
        text: `Welcome to our community, ${name}!
        Taskatto team is happy to see you here. Let me know how you get along with the app.
        `,
        html: `<strong>Welcome to our community, ${name}!</strong><p>Taskatto team is happy to see you here. Let me know how you get along with the app.</p>`

    })
};

const sendGoodByeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'paulinaokulska@gmail.com', 
        subject: 'We are sad to see you are leaving us!',
        text: `Goodbye, ${name}!
        Would you like to tell us what we could have done better? Taskatto team would highly appreciate your feedback. 
        `,
        html: `<strong>Goodbye, ${name}!</strong><p>Would you like to tell us what we could have done better to keep you on board? Taskatto team would highly appreciate your feedback. </p>`

    })
}





module.exports = {
    sendWelcomeEmail,
    sendGoodByeEmail
}