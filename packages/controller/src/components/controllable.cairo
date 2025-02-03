#[starknet::component]
mod ControllableComponent {
    // Internal imports

    use controller::models::account::AccountAssert;
    use controller::models::controller::ControllerAssert;
    use controller::models::signer::SignerAssert;

    // Storage

    #[storage]
    struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {}

    #[generate_trait]
    impl InternalImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {}
}
