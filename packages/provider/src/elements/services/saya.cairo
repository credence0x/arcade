use provider::elements::services::interface::ServiceTrait;

pub impl Saya of ServiceTrait {
    fn version() -> felt252 {
        '1.0.1'
    }
}
