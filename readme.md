Software architecture method -  Microservice architecture

Monolithic architecture

-- /login  -- completed
email
password

    token
    role
    userID
    firstname
    lastname

-- /signup -- completed - --- welcome email
    firstname
    lastname
    password
    email

-- /update - token
    firstname 
    lastname
    userID

-- /forgot-password
email

sends otp email

-- /change-password

-- /userID/:userID
    firstname
    lastname
    email
    role


-- /token  - completed
true/false

    role
    userID
    firstname
    lastname

-- /refreshtoken
 -- later

/dataleaum/buy-data
-- auth service - token -- firstname, userid
-- /dataleaum/buy-data

/auth - func(
    {
        shouldCallAuthService  : true, false,  
    }
) - to auth service



