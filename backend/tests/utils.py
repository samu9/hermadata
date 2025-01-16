from random import randint


def random_chip_code():
    return ".".join([str(randint(0, 999)).zfill(3) for _ in range(5)])
