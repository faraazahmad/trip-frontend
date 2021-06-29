import { useSession, getSession } from 'next-auth/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Header from '../../header'

function Company({ company }) {
    const [session, loading] = useSession();
    const [name, setName] = useState(company.name);
    const [about, setAbout] = useState(company.about);
    const [errors, setErrors] = useState({});
    const router = useRouter();

    const editCompany = async () => {
        const res = await fetch(`http://localhost:8000/api/organisation/${company.id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.tokens.access}`
            },
            body: JSON.stringify({name, about})
        });
        if (res.status !== 200) {
            const data = await res.json();
            setErrors(data);
        } else {
            router.push(`/companies/${company.id}/`);
        }
    }

    const errorMessage = () => {
        return (
            <article class="message is-danger">
                <div class="message-header">
                    <p>There were errors</p>
                </div>
                <div class="message-body">
                    {Object.entries(errors).map(([key, value]) => <p><strong>{key}</strong>: {value}</p>)}
                </div>
            </article>
        )
    }

    if (typeof window !== 'undefined' && loading) return null;

    if (session && company.admin === session.user.id) {
        return (
            <div>
                <Header/>
                <section className="hero is-light is-small">
                    <div className="hero-body">
                        <div className="container">
                            <h1 className="title">Edit Org</h1>
                        </div>
                    </div>
                </section>
                <br/>
                <div className="container">
                    {JSON.stringify(errors) !== '{}' && errorMessage()}
                    <div className="field">
                        <label className="label">Company Name</label>
                        <input className="input" value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="eg: Apple Inc."/>
                    </div>

                    <div className="field">
                        <label className="label">About</label>
                        <textarea className="textarea" value={about} onChange={(e) => setAbout(e.target.value)} type="text" placeholder="What is your company about?"/>
                    </div>

                    <div className="buttons">
                        <button className="button is-fourth" onClick={() => {editCompany()}}>Save</button>
                        <button className="button is-light" onClick={() => {router.push(`/companies/${company.id}/`)}}>Cancel</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <h1>You need to be logged in.</h1>
    )
}

export async function getServerSidePaths(context) {
    const session = await getSession(context);
    const res = await fetch(process.env.API_URL + '/organisations/', {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    });
    const companies = await res.json();

    const paths = companies.map((company) => ({
        params: { id: `${company.id}` }
    }));

    return { paths, fallback: false };
}

export async function getServerSideProps(context) {
    const session = await getSession(context);

    // params contains the post `id`.
    // If the route is like /posts/1, then params.id is 1
    const res = await fetch(process.env.API_URL + `/organisation/${context.params.companyId}/`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    })
    const company = await res.json();
  
    // Pass post data to the page via props
    return { props: { company: company } }
}

export default Company;