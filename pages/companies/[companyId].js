import { useSession, getSession } from 'next-auth/client';
import Link from 'next/link';
import Header from '../header'

function Company({ company }) {
    const [session, loading] = useSession();

    if (typeof window !== 'undefined' && loading) return null;

    if (session) {
        return (
            <div>
                <Header/>
                <section className="hero container">
                    <div className="hero-body">
                        <div className="columns is-vcentered">
                            <div className="column has-text-left">
                                <p className="title is-size-1 has-text-dark">{company.name}</p>
                                {/* <p className="subtitle">{tech.name}</p> */}
                            </div>
                            <div className="column is-one-quarter has-text-right">
                                {/* <button onClick={() => downloadFiles()} className='button is-warning'>Download project files</button> */}
                            </div>
                        </div>
                    </div>
                </section>
                <hr/>
                <div className="container">
                    <div className="columns">
                        <div className="column is-one-third">
                            <h2 className="subtitle">About Us</h2>
                            <p>{company.about}</p>
                        </div>
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
    const res = await fetch('http://localhost:8000/api/organisations/', {
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
    const res = await fetch(`http://localhost:8000/api/organisation/${context.params.companyId}/`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    })
    const company = await res.json();
  
    // Pass post data to the page via props
    return { props: { company: company[0] } }
}

export default Company;