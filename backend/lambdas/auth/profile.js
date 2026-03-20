const jwt = require("jsonwebtoken");

const SECRET = "athletefuel-secret";

exports.handler = async (event) => {
  try {

    const authHeader =
      event.headers.Authorization || event.headers.authorization;

    if (!authHeader) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: "Token required"
        })
      };
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, SECRET);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Profile retrieved",
        user: decoded
      })
    };

  } catch (error) {

    return {
      statusCode: 401,
      body: JSON.stringify({
        message: "Invalid token"
      })
    };

  }
};