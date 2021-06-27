import { getSession } from 'next-auth/client';
import Link from 'next/link';
import Header from '../../header';

function Job({ job, company, applications, problemSets, applicants, session }) {
    
    if (session && company.admin === session.user.id) {
        return (
            <div>
                <Header/>
                <section className="hero container is-small is-fifth is-jumbo">
                    <div className="hero-body">
                        <div className="columns is-vcentered">
                            <div className="column has-text-left">
                                <p className="title is-size-1">Dashboard</p>
                                <p className="subtitle"><Link href={`/jobs/${job.id}`}><a className="has-text-fourth">{job.title} - {company.name}</a></Link></p>                               
                            </div>
                            <div className="column is-one-quarter has-text-right">
                                {company.admin === session.user.id && 
                                <Link href={`/jobs/${job.id}/edit`} >
                                    <a className="button is-danger is-inverted">
                                        <i className="fas fa-edit"></i>
                                        &emsp;
                                        Edit Job Profile
                                    </a>
                                </Link>}
                            </div>
                        </div>
                    </div>
                </section>
                <br/><br/>
                <div className="container">
                    <div className="columns">
                        <div className="column">
                            <div className="box dashboard">
                                {job.description ? 
                                    <i className="has-text-success fas fa-check-circle"></i> : 
                                    <i className="has-text-warning fas fa-exclamation-triangle"></i>
                                }
                                &emsp;
                                Job description
                            </div>
                        </div>
                        <div className="column">
                            <div className="box dashboard">
                                {problemSets.length > 0 ? 
                                    <i className="has-text-success fas fa-check-circle"></i> : 
                                    <i className="has-text-warning fas fa-exclamation-triangle"></i>
                                }
                                &emsp;
                                Problem sets
                            </div>
                        </div>
                        <div className="column">
                            <div className="box dashboard">
                                <i className="has-text-success fas fa-check-circle"></i>
                                &emsp;
                                Culture-fit interview
                            </div>
                        </div>
                    </div>
                    <h1 className="subtitle">{applications.length} Applicants</h1>
                    <table className="table is-fullwidth is-hoverable">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants.map(app => (
                                <tr>
                                    <td>{app.username}</td>
                                    <td>{applications.find(a => a.user === app.id).status}</td>
                                    <td>...</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    return (
        <div className="container">
            <Header/>
            <h1 className="title">You don't have access to this page.</h1>
        </div>
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

    if (!session) {
        return { props: {} };
    }

    const jobRes = await fetch(`http://localhost:8000/api/job/${context.params.jobId}/`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    })
    const job = await jobRes.json();
    const problemSets = job.problem_sets.split(',').map(set => parseInt(set));

    const companyRes = await fetch(`http://localhost:8000/api/organisation/${job.organisation}/`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    })
    const company = await companyRes.json();

    const applicationRes = await fetch(`http://localhost:8000/api/applications/?job=${job.id}`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    })
    const applications = await applicationRes.json();

    const appUsersRes = await fetch(`http://localhost:8000/api/job/${job.id}/users/`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    });
    const applicants = await appUsersRes.json()
  
    // Pass post data to the page via props
    return { props: { job, company, applications, problemSets, applicants, session } }
}

export default Job;