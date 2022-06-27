import pool from "../db/pg.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { json } from "express";

/*********************___Create a New User___*************************/
export const createNewUser = async (req, res) => {
  let company_id;
  let role_id;
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      username,
      company_name,
      adress,
      number,
      zip,
      city,
      country,
      role,
    } = req.body;

    await pool
      .query(`SELECT id FROM roles WHERE role = $1;`, [role])
      .then((roleID) => (role_id = roleID.rows[0].id)); //Get the role ID from roles Table
    const hashedPassword = await bcrypt.hash(password, 10);

    //Check if Username OR Email  already used
    await pool
      .query(`SELECT * FROM users WHERE  email = $1 OR username = $2;`, [
        email,
        username,
      ])
      .then((user) => {
        if (user.rowCount == 0) {
          //Username OR Email not used
          pool
            .query(
              //Check if Company already exists
              `SELECT * FROM company WHERE name=$1;`,
              [company_name]
            )
            .then((company) => {
              if (company.rowCount == 0) {
                //company dont exists => Add new Company first
                pool
                  .query(
                    `INSERT INTO company (name, adress, number, zip, city, country) 
               VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
                    [company_name, adress, number, zip, city, country]
                  )
                  .then((addedCompany) => {
                    company_id = addedCompany.rows[0].id; //Get the Id from the new Company (To insert in Users as company_id)
                    //console.log(`company ID: ${company_id}`);
                    if (company_id) {
                      pool
                        .query(
                          `INSERT INTO users (email, password, first_name, last_name, username, company_id, role_id)
                  VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
                          [
                            email,
                            hashedPassword,
                            first_name,
                            last_name,
                            username,
                            company_id,
                            role_id,
                          ]
                        )
                        .then((user) => {
                          const newUser = user.rows[0];
                          console.log(newUser);

                          const token = jwt.sign(
                            { email: user.email }, //payload
                            process.env.JWT_SECRET, //secret
                            { expiresIn: "1h" } //options
                          );
                          //console.log(token);
                          if (token) {
                            res
                              .status(201)
                              .set("Authorization", token) //fügt dem Header der Response ein Feld "Authorization" hinzu mit dem Wert des tokens
                              .json(user);
                          }
                        })
                        .catch((err) => res.json(err));
                    }
                  });
              } else {
                console.log("Company Already Exists");
                //If the Company already exists --> Get the Company ID from the Response
                company_id = company.rows[0].id;
                pool
                  .query(
                    `INSERT INTO users (email, password, first_name, last_name, username, company_id, role_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
                    [
                      email,
                      hashedPassword,
                      first_name,
                      last_name,
                      username,
                      company_id,
                      role_id,
                    ]
                  )
                  .then((user) => {
                    console.log(user.rows[0]);
                    //token kreieren
                    const token = jwt.sign(
                      { email: user.email }, //payload
                      process.env.JWT_SECRET, //secret
                      { expiresIn: "1h" } //options
                    );
                    //console.log(token);
                    if (token) {
                      res
                        .status(201)
                        .set("Authorization", token) //fügt dem Header der Response ein Feld "Authorization" hinzu mit dem Wert des tokens
                        .json(user);
                    }
                  })
                  .catch((err) => res.json(err));
              }
            });
        } else {
          console.log("Username Or Email Already used!!");
          res.send("User already exists");
        }
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*********************___Delete User ___*************************/
export const deleteUser = async (req, res) => {
  const { email, username, adminPassword, adminUsername } = req.body;
  //Check if the user exists
  try {
    await pool
      .query(`SELECT * FROM users WHERE  email = $1 AND username = $2;`, [
        email,
        username,
      ])
      .then((user) => {
        if (user.rowCount == 0) {
          res
            .status(404)
            .json("User not found")
            .catch((err) => json(err));
        } else {
          pool
            .query(
              //Get the Admin Password from the Database
              `SELECT password FROM users WHERE username = $1;`,
              [adminUsername]
            )
            .then((res) => {
              const adminStoredPassword = res.rows[0].password;
              //Compare the given password with the stored password
              bcrypt.compare(adminPassword,adminStoredPassword).then((result)=>{
                if(result){  //Password matches
                  pool.query(
                    `Delete from users WHERE username = $1 AND email = $2 RETURNING *`,[username, email]
                  )
                  .then((res) => res.status(204).json("User successfully deleted"))
                  .catch((err) => json(err))
                } else {  //Password does not match
                     console.log("Something went wrong!!");
                     res.status(204).json("something sdsd ")
                }
              })
              })   
        }
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*********************___Update existing User___*************************/
export const updateUser = async (req, res) => {};

/*********************___Get a list of all users___*************************/
export const getAllUsers = async (req, res) => {};

/*********************___Delete User Ticket___*************************/
export const deleteUserTicket = async (req, res) => {};

/*********************___Update existing Ticket ___*************************/
export const updateTicket = async (req, res) => {};

/*********************___Get All the Ticket from one User___*************************/
export const getUserTickets = async (req, res) => {};

/*********************___Get Infos from a User___*************************/
export const getUserInfos = async (req, res) => {};

/*********************___Get all the Tickets from All Users___*************************/
export const getTicketsFromAllUsers = async (req, res) => {};