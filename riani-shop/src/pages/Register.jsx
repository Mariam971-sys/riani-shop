import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


function Register() {

  const navigate = useNavigate();


  const [formData, setFormData] = useState({

    name: "",
    email: "",
    password: "",
    confirmPassword: "",

  });


  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");





  function handleChange(e) {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value,

    });

  }






  async function handleSubmit(e) {

    e.preventDefault();


    setError("");



    const {
      name,
      email,
      password,
      confirmPassword,
    } = formData;




    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword
    ) {

      setError(
        "Please fill in all fields"
      );

      return;

    }





    if (password !== confirmPassword) {

      setError(
        "Passwords do not match"
      );

      return;

    }





    try {


      setLoading(true);



      const response = await axios.post(

        "http://localhost:5000/api/users/register",

        {

          name,

          email,

          password,

        }

      );




      // Save user information if token exists

      if (response.data.token) {

        localStorage.setItem(
          "token",
          response.data.token
        );


        localStorage.setItem(
          "userInfo",
          JSON.stringify(response.data)
        );

      }




      alert(
        "Registration successful"
      );



      navigate("/login");



    } catch (error) {


      setError(

        error.response?.data?.message ||

        "Registration failed"

      );


    } finally {


      setLoading(false);


    }


  }







  return (

    <main

      style={{

        textAlign: "center",

        padding: "80px 20px",

      }}

    >


      <h1>
        Register
      </h1>



      {
        error && (

          <p

            style={{

              color: "red",

              marginTop: "20px",

            }}

          >

            {error}

          </p>

        )
      }






      <form

        onSubmit={handleSubmit}

        style={{

          maxWidth: "400px",

          margin: "30px auto",

          display: "flex",

          flexDirection: "column",

          gap: "15px",

        }}

      >




        <input

          type="text"

          name="name"

          placeholder="Full Name"

          value={formData.name}

          onChange={handleChange}

          style={inputStyle}

        />





        <input

          type="email"

          name="email"

          placeholder="Email"

          value={formData.email}

          onChange={handleChange}

          style={inputStyle}

        />





        <input

          type="password"

          name="password"

          placeholder="Password"

          value={formData.password}

          onChange={handleChange}

          style={inputStyle}

        />





        <input

          type="password"

          name="confirmPassword"

          placeholder="Confirm Password"

          value={formData.confirmPassword}

          onChange={handleChange}

          style={inputStyle}

        />





        <button

          type="submit"

          disabled={loading}

          style={buttonStyle}

        >

          {

            loading

            ?

            "Creating Account..."

            :

            "Register"

          }


        </button>





      </form>



    </main>

  );

}





const inputStyle = {

  padding: "12px",

  fontSize: "15px",

  borderRadius: "6px",

  border: "1px solid #ccc",

};



const buttonStyle = {

  padding: "12px",

  backgroundColor: "#222",

  color: "white",

  border: "none",

  borderRadius: "6px",

  cursor: "pointer",

  fontSize: "16px",

};



export default Register;