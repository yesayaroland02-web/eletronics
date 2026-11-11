export const transporter = {
  async sendMail(options: {
    from?: string;
    to: string;
    subject: string;
    html: string;
  }) {
    console.log(`[MAIL SIMULATION] To: ${options.to} | Subject: ${options.subject}`);
    return {
      accepted: [options.to],
      rejected: [],
      response: "250 OK (Simulation)",
    };
  },
};