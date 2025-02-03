#[starknet::component]
pub mod ControllableComponent {
    // Internal imports

    use controller::models::account::AccountAssert;
    use controller::models::controller::ControllerAssert;
    use controller::models::signer::SignerAssert;

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {}
}
