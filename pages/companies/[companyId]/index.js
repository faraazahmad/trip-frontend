import { useSession, getSession } from 'next-auth/client';
import Link from 'next/link';
import Header from '../../header';
import ReactMarkdown from "react-markdown";

function Company({ company, admin, jobs }) {
    const [session, loading] = useSession();
    const EditLink = () => <Link href={`/companies/${company.id}/edit`}><a className="has-text-weight-bold has-text-fourth">Edit Page</a></Link>
    const JobBox = (job) => (
        <div className="job box">
            <p className="title is-6">{job.title}</p>
            <p className="subtitle is-6">${job.compensation_pa/1000}k · {job.equity}%</p>
        </div>
    );


    if (typeof window !== 'undefined' && loading) return null;

    if (session) {
        return (
            <div>
                <Header/>
                <section className="hero container is-first is-jumbo">
                    <div className="hero-body">
                        <div className="columns is-vcentered">
                            <div className="column has-text-left">
                                {company.admin === session.user.id && <p className="subtitle "><EditLink/></p>}
                                <p className="title is-size-1">{company.name}</p>
                                {/* <p className="subtitle">{tech.name}</p> */}
                            </div>
                            <div className="column is-one-quarter">
                                <div className="box is-first">
                                    <p className="has-text-fourth">Admin</p>
                                    <p className="has-text-cream has-text-weight-bold">{admin.username}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <br/><br/>
                <div className="container">
                    <div className="columns">
                        <div className="column">
                            <p className="content"><ReactMarkdown>{company.about}</ReactMarkdown></p>
                        </div>
                        <div className="column is-one-third jobs-sidebar">
                            <h2 className="title">Jobs</h2>
                            <ul>{jobs.map(job => JobBox(job))}</ul>
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

    const userRes = await fetch(process.env.API_URL + `/user/${company.admin}/`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    })
    const admin = await userRes.json();

    const jobRes = await fetch(process.env.API_URL + `/jobs/?company=${company.id}/`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    })
    const jobs = await jobRes.json();
  
    // Pass post data to the page via props
    return { props: { company, admin, jobs } }
}

export default Company;