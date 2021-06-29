import { getSession, useSession } from 'next-auth/client'
import Link from 'next/link'
import Header from '../header'

function CompaniesIndex({ companies }) {
    const [session, loading] = useSession();
    
    if (typeof window !== 'undefined' && loading) return null;

    if (session && companies) {
        return (
            <>
                <Header/>
                <div className="container">
                    <h1 className='title'>Companies</h1>
                    <Link href="/companies/new"><a className="button">Create new</a></Link>
        
                    <ul>
                        {companies.map((company) => (
                            <li key={company.id}>
                                <Link href={`companies/${company.id}`}>
                                    <a>{company.name}</a>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </>
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
    const res = await fetch(process.env.API_URL + `/organisations/`, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const companies = await res.json();
  
    if (companies) {
        return { props: { companies } }
    } else {
        return { props: {} }
    }
}

export default CompaniesIndex