import Head from "next/head";
import Header from '@components/Header'
import { getSortedPostsData, getPostData } from '@lib/posts'
import Date from '@components/Date'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { useMDXComponents } from '@components/mdx-components'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

const Post = (props: any) => {
    return (
        <div>
            <Head>
                <title>{`${props.post.title} - nosaka.xyz`}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header/>
            <div className="mt-8 xl:mt-10 mx-auto w-5/6 md:w-9/12 lg:w-8/12">
                <div className="sm:w-10/12 xl:w-9/12 mx-auto">
                    {props.post.image && (
                        <div className="mt-0 mb-8 w-6/7 mx-auto">
                            <img
                                src={props.post.image}
                                alt={props.post.imagealt}
                            />
                        </div>
                    )}
                    <h1 className="text-3xl md:text-4xl font-extrabold">{props.post.title}</h1>
                    <h3 className="md:text-xl font-light text-chestnut">{props.post.subtitle}</h3>
                    <div className="mt-1 font-light">
                        <Date date={props.post.date}/>
                    </div>
                    <article className="prose max-w-none py-10 font-cmu ">
                        <MDXRemote
                            {...props.source}
                            components={useMDXComponents}
                        />
                    </article>
                </div>

            </div>
        </div>
    )
}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// the path has not been generated.
export async function getStaticPaths() {
  const posts = await getSortedPostsData()

  // Get paths
  const paths = posts.map((post: any) => ({
    params: { post: post.id },
  }))

  // We'll pre-render only these paths at build time.
  // { fallback: blocking } will server-render pages
  // on-demand if the path doesn't exist.
  return { paths, fallback: 'blocking' }
}

// This also gets called at build time
export async function getStaticProps( params: {params: { post: string }} ) {
    // params contains the post `post`.
    // If the route is like /post/1, then params.post is 1
    const id = params.params.post
    const postData = getPostData(id);
    const mdxSource = await serialize(postData.content, {
        mdxOptions: {
            remarkPlugins: [remarkGfm,],
            rehypePlugins: [
                [ rehypePrettyCode, { 
                    keepBackground: false, 
                    // theme: 'one-dark-pro',
                    // theme: 'rose-pine',
                    theme: 'github-dark-dimmed',
                    defaultLang: "plaintext",
                }, rehypeSlug, rehypeAutolinkHeadings],
            ],
            format: 'mdx'
        },
        parseFrontmatter: false,
    })
    // const post = await sanity.fetch(query, { slug })
    // Pass post data to the page via props
    return { props: { post: postData.data, source: mdxSource} }
}

export default Post