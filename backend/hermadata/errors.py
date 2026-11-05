class APIException(Exception):
    pass


class InvalidFiscalCodeException(APIException):
    pass


class DuplicateFiscalCodeException(APIException):
    pass
