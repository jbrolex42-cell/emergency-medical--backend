const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models");
const { JWT_SECRET } = require("../config/env");
const { authValidators } = require("../validators/validator");
const authService = {

async register(data){

const user = await User.create({
email: data.email,
password: data.password,
firstName: data.firstName,
lastName: data.lastName,
phone: data.phone,
role: data.role,
county: data.county,
idNumber: data.idNumber,
emergencyContactName: data.emergencyContactName,
emergencyContactPhone: data.emergencyContactPhone,
bloodType: data.bloodType,
allergies: data.allergies
});

const token = jwt.sign(
{ userId:user.id },
JWT_SECRET,
{ expiresIn:"7d" }
);

return {
token,
user
};

},

async login(identifier,password){

const user = await User.findOne({
where:{
email:identifier
}
});

if(!user){
throw new Error("Invalid credentials");
}

const valid = await bcrypt.compare(password,user.password);

if(!valid){
throw new Error("Invalid credentials");
}

const token = jwt.sign(
{ userId:user.id },
JWT_SECRET,
{ expiresIn:"7d" }
);

return {
token,
user
};

},

async getUserById(id){
return User.findByPk(id,{
attributes:{exclude:["password"]}
});
},

async updateProfile(id,data){

await User.update(data,{
where:{id}
});

return this.getUserById(id);

},

async logout(){
return true;
},

async refreshToken(){
return true;
}

};

module.exports = authService;