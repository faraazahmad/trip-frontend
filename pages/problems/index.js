import { getSession, useSession } from 'next-auth/client'
import Link from 'next/link'
import Header from '../header'

function ProblemsIndex({ problems }) {
    const [session, loading] = useSession();
    
    if (typeof window !== 'undefined' && loading) return null;

    if (session && problems) {
        return (
            <>
                <Header/>
                <div className="container">
                    <h1 className='title'>Problems</h1>
        
                    <ul>
                        {problems.map((problem) => (
                            <li key={problem.id}>
                                <Link href={`problems/${problem.id}`}>
                                    <a>{problem.title}</a>
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
    const res = await fetch(process.env.API_URL + `/problems/`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    })
    const problems = await res.json();
  
    if (problems) {
        return { props: { problems } }
    } else {
        return { props: {} }
    }
}

export default ProblemsIndex