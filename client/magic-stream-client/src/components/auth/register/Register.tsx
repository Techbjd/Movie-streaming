
import RegisterForm from "./RegisterForm"
import AuthLayout from "./AuthLayout"
import registerImage from "@/assets/bg.jpg"
const Register = () => {
  return (
   
     
    <AuthLayout image={registerImage} >
      <RegisterForm  />
    </AuthLayout>
 
    
  )
}

export default Register
