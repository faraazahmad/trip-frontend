import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import jwt_decode from 'jwt-decode'

export default NextAuth({
    providers: [
        Providers.Credentials({
            name: 'Credentials',

            credentials: {
                username: { label: 'username', type: 'text', placeholder: 'e.g: stevejobs' },
                password: { label: 'password', type: 'password' }
            },

            async authorize(credentials, req) {
                const loginRes = await fetch('http://localhost:8000/api/token/', {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: {'Content-Type': 'application/json'},
                });
                const tokens = await loginRes.json();
                const payload = jwt_decode(tokens.access);
                const user_resp = await fetch(`http://localhost:8000/api/user/${payload.user_id}/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${tokens.access}`
                    }
                });

                const user = await user_resp.json();

                if (user) { return {tokens, user}; }
                else { return null; }
            }
        })
    ],
    callbacks: {
        jwt: async (token, user, account, profile, isNewUser) => {
            //  "user" parameter is the object received from "authorize"
            //  "token" is being send below to "session" callback...
            //  ...so we set "user" param of "token" to object from "authorize"...
            //  ...and return it...
            user && (token.user = user);
            return Promise.resolve(token)   // ...here
        },
        session: async (session, {user, iat, exp}) => {
            //  "session" is current session object
            //  below we set "user" param of "session" to value received from "jwt" callback
            if (user.tokens) {
                session.user = user.user;
                session.tokens = user.tokens;
                session.iat = iat;
                session.expires = exp;
            }
            return Promise.resolve(session)
        }
    }
});