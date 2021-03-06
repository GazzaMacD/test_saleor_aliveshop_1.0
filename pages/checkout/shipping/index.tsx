import * as React from 'react';
import { Head } from '@/components/modules/Head';
import { Footer } from '@/components/modules/Footer';
import { CheckoutShippingForm } from '@/components/modules/CheckoutShippingForm';
import { FooterBranding } from '@/components/elements/FooterBranding';
import styles from '@/styles/page-styles/Shipping.module.scss';
import { CheckOutProcessTracker } from '@/components/elements/CheckOutProcessTracker';
import { useRouter } from 'next/router';

interface IShippingPageProps {
  apiEndpoint: string;
  shoppingCart: Array<Record<string, unknown> | []>;
  cartVisible: boolean;
  setCartVisible: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddToCart: (id: string) => void;
}

const ShippingPage: React.FC<React.PropsWithChildren<IShippingPageProps>> = ({
  checkoutProcess,
  apiEndpoint,
  shoppingCart,
  setFlashMessages,
  appCheckoutUpdateShipping,
  ...pageProps
}): JSX.Element => {
  const checkoutPageName = 'shipping';
  const [formLoadState, setFormLoadState] = React.useState('loading');
  const router = useRouter();

  let fragment;

  React.useEffect(() => {
    if (
      shoppingCart.length === 0 ||
      !checkoutProcess.availableShippingMethods
    ) {
      setFlashMessages([
        'you have nothing in your cart, please consider buying something first',
      ]);
      if (typeof window !== 'undefined') {
        router.push('/');
      }
      setFormLoadState('redirect');
    } else {
      console.log(
        'Shipping Page useEffect --> checkoutProcess',
        checkoutProcess
      );
      setFormLoadState('loaded');
    }
  }, [checkoutProcess, shoppingCart, setFlashMessages, router]);

  if (formLoadState === 'loading') {
    fragment = <p>Loading form</p>;
  } else if (formLoadState === 'loaded') {
    fragment = (
      <CheckoutShippingForm
        appCheckoutUpdateShipping={appCheckoutUpdateShipping}
        availableShippingMethods={checkoutProcess.availableShippingMethods}
        apiEndpoint={apiEndpoint}
        checkoutId={checkoutProcess.checkoutId}
      />
    );
  } else if (formLoadState === 'redirect') {
    fragment = <p>loading</p>;
  } else {
    fragment = <p>Oops Something went wrong</p>;
  }

  return (
    <>
      <Head />
      <main>
        <div className={`${styles.shippingContainer} container`}>
          <CheckOutProcessTracker checkoutPageName={checkoutPageName} />
          {fragment}
        </div>
      </main>
      <Footer>
        <FooterBranding />
      </Footer>
    </>
  );
};

export default ShippingPage;
