import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import { Card } from "@modules/common/components/ui"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="content-shell py-6" data-testid="cart-container">
      {cart?.items?.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          <Card>
            <Card.Header>
              <Card.Title>Shopping Cart</Card.Title>
            </Card.Header>
            <Card.Content>
              {!customer && (
                <>
                  <SignInPrompt />
                  <Divider />
                </>
              )}
              <ItemsTemplate cart={cart} />
            </Card.Content>
          </Card>
          <div className="lg:sticky lg:top-20 h-fit">
            {cart && cart.region && <Summary cart={cart} />}
          </div>
        </div>
      ) : (
        <Card>
          <Card.Content>
            <EmptyCartMessage />
          </Card.Content>
        </Card>
      )}
    </div>
  )
}

export default CartTemplate
