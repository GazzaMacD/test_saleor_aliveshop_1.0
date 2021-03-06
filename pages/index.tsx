import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Head } from '@/components/modules/Head';
import { Footer } from '@/components/modules/Footer';
import { FooterBranding } from '@/components/elements/FooterBranding';
import styles from '@/styles/page-styles/Home.module.scss';
import { client } from '@/utils/api-client';

const FeaturedFour = (): JSX.Element => {
  const [state, setState] = useState({
    status: 'idle',
    response: null,
    error: null,
  });
  const { status, response, error } = state;
  useEffect(() => {
    setState({ status: 'pending', response: null, error: null });
    const fetchFourQuery = `query{
      products(first: 4 filter: { search: "Polo Shirt" }) {
        edges {
          node {
            id
            name
            slug
            description
            images {
              alt
              url
            }
          }
          cursor
        }
      }
    }`;
    const clientCongfig = {
      method: 'POST',
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        query: fetchFourQuery,
      }),
    };
    const response = client('http://127.0.0.1:8000/graphql/', clientCongfig);
    response
      .then((responseObj: any) => {
        setState({ status: 'resolved', response: responseObj, error: null });
      })
      .catch((error: any) => {
        setState({ status: 'rejected', response: null, error: error });
      });
  }, []);

  if (status === 'idle' || status === 'pending') {
    return (
      <ul className={styles.featuredFour}>
        <li>Loading...</li>;
      </ul>
    );
  } else if (status === 'rejected') {
    console.error(`There was an error`, error);
    return (
      <ul className={styles.featuredFour}>
        <li>No products available</li>;
      </ul>
    );
  } else if (status === 'resolved') {
    // @ts-ignore: Object is possibly 'null'
    const edgesArray = response.data.products.edges;
    if (edgesArray.length > 0) {
      return (
        <ul className={styles.featuredFour}>
          {edgesArray.map((edge: any) => {
            const { id, name, images, slug } = edge.node;
            return (
              <li key={id}>
                <Link href={`/products/${encodeURIComponent(slug)}`}>
                  <a>
                    <article>
                      <img src={images[0].url} />
                      <h3>{name}</h3>
                    </article>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      );
    }
  }
  return (
    <ul className={styles.featuredFour}>
      <li>Sorry no featured products today</li>
    </ul>
  );
};

interface IPageProps {
  shoppingCart: Array<Record<string, unknown> | []>;
  cartVisible: boolean;
  setCartVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const Home: React.FC<IPageProps> = ({
  shoppingCart,
  cartVisible,
  setCartVisible,
}): JSX.Element => {
  return (
    <>
      <Head />
      <main>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            Welcome to <a href="https://alive-web.vn/">Alive Shop</a>
          </h1>
        </div>
        <div className={'container'}>
          <ul className={styles.featuredFour}>
            <FeaturedFour />
          </ul>
        </div>
      </main>
      <Footer>
        <FooterBranding />
      </Footer>
    </>
  );
};

export default Home;
