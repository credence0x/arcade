#[starknet::component]
pub mod FollowableComponent {
    // Dojo imports

    use dojo::world::WorldStorage;

    // Internal imports

    use social::store::StoreTrait;

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
    > of InternalTrait<TContractState> {
        fn follow(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            followed: felt252,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Effect] Follow
            let time = starknet::get_block_timestamp();
            store.follow(player_id, followed, time);
        }

        fn unfollow(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            followed: felt252,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);

            // [Effect] Unfollow
            store.unfollow(player_id, followed);
        }
    }
}
