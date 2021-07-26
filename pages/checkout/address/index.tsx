import * as React from 'react';
import { Head } from '@/components/modules/Head';
import { Footer } from '@/components/modules/Footer';
import { AddressForm } from '@/components/modules/AddressForm';
import { FooterBranding } from '@/components/elements/FooterBranding';
import styles from '@/styles/page-styles/Address.module.scss';
import { LoginRegistrationForm } from '@/components/modules/LoginRegistrationForm';

interface IAddressPageProps {
  apiEndpoint: string;
  shoppingCart: Array<Record<string, unknown> | []>;
  cartVisible: boolean;
  setCartVisible: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddToCart: (id: string) => void;
}

function customerStatusReducer(state, action) {
  switch (action.type) {
    case 'undecided':
      return { status: action.type, userEmail: '' };
    case 'anon':
      return { status: action.type, userEmail: '' };
    case 'loggedin':
      return { status: action.type, userEmail: action.email.trim() };
    default:
      throw new Error(`Incorrect type for customer status, ${action.type} `);
  }
}

/* AnonOrLoggin */
const AnonOrLoggin: React.FC<{ customerStatusDispatch: React.Dispatch<any> }> =
  ({ customerStatusDispatch }) => {
    return (
      <div
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h2>Continue As Guest</h2>
          <button onClick={() => customerStatusDispatch({ type: 'anon' })}>
            continue as guest
          </button>
        </div>
        <div>
          <LoginRegistrationForm
            formTitle="Registered User"
            buttonText="Sign In"
          />
        </div>
      </div>
    );
  };

const AddressPage: React.FC<React.PropsWithChildren<IAddressPageProps>> = (
  pageProps
): JSX.Element => {
  const [customerStatus, customerStatusDispatch] = React.useReducer(
    customerStatusReducer,
    { status: 'undecided', userEmail: '' }
  );
  const { status } = customerStatus;
  let addressPageContent: any;

  if (status === 'undecided') {
    addressPageContent = (
      <AnonOrLoggin customerStatusDispatch={customerStatusDispatch} />
    );
  } else if (status === 'anon') {
    addressPageContent = (
      <>
        <h1>Checkout address </h1>
        <AddressForm />
      </>
    );
  } else if (status === 'loggedin') {
    addressPageContent = (
      <>
        <h1>Welcome Back Username here </h1>
        <p>Component for Logged in User Here</p>
      </>
    );
  } else {
    addressPageContent = <p>Error</p>;
  }

  return (
    <>
      <Head />
      <main>
        <div className={`${styles.addressContainer} container`}>
          {addressPageContent}
        </div>
      </main>
      <Footer>
        <FooterBranding />
      </Footer>
    </>
  );
};

export default AddressPage;
