import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};
//https://www.npmjs.com/package/jsonwebtoken

//middleware for the placeorderscreen, to slice off first 7 char
export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); //chop 7 from  Bearer xxx
    //verify with jwt
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: "Invalid Token" });
      } else {
        req.user = decode;
        next(); //continue to next middle ware
      }
    });
  } else {
    res.status(401).send({ message: "No Token" });
  }
};

export const lettersOnly = (string) => {
  return /^[a-zA-Z ]+$/.test(string);
}

export const numbersOnly = (string) => {
  return /^[0-9]+$/.test(string);
}

export const alphanumeric = (string) => {
  return /^[a-zA-Z0-9 ]+$/.test(string);
}

export const passwordCheck = (string) => {
  return /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9 #$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~ ]+){8,128}$/.test(string);
}