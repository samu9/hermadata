from random import choice, randint
from string import ascii_uppercase

from codicefiscale import codicefiscale


def random_chip_code():
    return ".".join([str(randint(0, 999)).zfill(3) for _ in range(5)])


def random_fiscal_code(birthplace: str = "H501") -> str:
    """A valid codice fiscale (born 01/01/1980) with random name letters.

    Fiscal codes must be unique and test data is committed, so each test
    needs its own.
    """

    def letters():
        return "".join(choice(ascii_uppercase) for _ in range(6))

    return codicefiscale.encode(
        lastname=letters(),
        firstname=letters(),
        gender="M",
        birthdate="01/01/1980",
        birthplace=birthplace,
    )
