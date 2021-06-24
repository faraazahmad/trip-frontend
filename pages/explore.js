import { getSession, useSession } from 'next-auth/client'
import Link from 'next/link'
import Header from './header'

function Explore({ companies, jobs }) {
    const [session, loading] = useSession();
    const JobBox = (job) => (
        <Link href={`/jobs/${job.id}`}>
            <a>
                <div className="job box">
                    <p className="title is-6">{job.title}</p>
                    <p className="subtitle is-6">${job.compensation_pa/1000}k · {job.equity}%</p>
                </div>
            </a>
        </Link>
    );
    
    if (typeof window !== 'undefined' && loading) return null;

    if (session && companies) {
        return (
            <div className="explore">
                <Header/>
                <section className="hero is-small container is-fourth is-jumbo">
                    <div className="hero-body">
                        <div className="columns is-vcentered">
                            <div className="column has-text-left">
                                <p className="title is-size-1 has-text-cream">Explore</p>
                                {/* <p className="subtitle">{tech.name}</p> */}
                            </div>
                            <div className="column is-one-quarter">
                                <div className="box">
                                    <p className="has-text-weight-bold has-text-cream">Trending Startup</p>
                                    <br/>
                                    <div className="box">
                                        <p className="has-text-cream">m16 Labs</p>
                                    </div>
                                </div>
                                <div className="box">
                                    <p className="has-text-weight-bold has-text-cream">  Job</p>
                                    <br/>
                                    <div className="box">
                                        <p className="has-text-cream has-text-weight-bold">Senior Product Manager</p>
                                        <p className="has-text-cream">m16 Labs</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <br/><br/>
                <div className="container">
                    <div className="columns">
                        <div className="column">
                            <h1 className="title">Latest Jobs</h1>
                            <div className="jobs-sidebar">{jobs.map(JobBox)}</div>
                            <br/>
                            <h1 className="title">Newest startups</h1>
                            <ul>
                                {companies.map((company) => (
                                    <li key={company.id}>
                                        <Link href={`companies/${company.id}`}>
                                            <a>
                                                <div className="box job">
                                                    <p>{company.name}</p>
                                                </div>
                                            </a>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <Header/>
            <section className="hero">
                <div className="hero-body">
                    <p className="title">You need to be logged in</p>
                </div>
            </section>
        </>
    )
}

export async function getServerSideProps(context) {
    const session = await getSession(context);

    if (!session) {
        return { props: {} }
    }
    // params contains the post `id`.
    // If the route is like /posts/1, then params.id is 1
    const res = await fetch(`http://localhost:8000/api/organisations/`, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const companies = await res.json();

    const jobRes = await fetch(`http://localhost:8000/api/jobs/`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    })
    const jobs = await jobRes.json();
  
    if (companies) {
        return { props: { companies, jobs } }
    } else {
        return { props: {} }
    }
}

export default Explore