import axios from "axios";

async function verifyCaptcha(token){
    //sends secret key and response token to google
    try {
      let result = await axios({
        method: "post",
        url: "https://www.google.com/recaptcha/api/siteverify",
        params: {
          secret: process.env.CAPTCHA_SECRET_KEY,
          response: token,
        },
      });
      let data = result.data || {};
      if (!data.success) {
        throw {
          success: false,
          error: "response not valid",
        };
      }else{
        return "Captcha Success"
      }
    } catch (err) {
      return "Captcha Error"; //401 is unauthorized
    }
}

export default {verifyCaptcha}