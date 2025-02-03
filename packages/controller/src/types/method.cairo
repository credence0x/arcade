#[derive(Copy, Drop, PartialEq)]
pub enum Method {
    None,
    WebAuthn,
    StarknetAccount,
}

// Implementations

pub impl IntoMethodU8 of core::traits::Into<Method, u8> {
    #[inline]
    fn into(self: Method) -> u8 {
        match self {
            Method::None => 0,
            Method::WebAuthn => 1,
            Method::StarknetAccount => 2,
        }
    }
}

pub impl IntoU8Method of core::traits::Into<u8, Method> {
    #[inline]
    fn into(self: u8) -> Method {
        match self {
            0 => Method::None,
            1 => Method::WebAuthn,
            2 => Method::StarknetAccount,
            _ => Method::None,
        }
    }
}
