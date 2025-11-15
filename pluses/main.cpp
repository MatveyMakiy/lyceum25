#include <iostream>
#include <cstdint>
#include <cmath>
using namespace std;

uint64_t area(int a) {
    uint64_t area = a * a;
    return area;
}
uint64_t area(int a, int b) {
    uint64_t area = a * b;
    return area;
}
double area(int a, int b, int c) {
    if (a + b > c && a + c > b && b + c > a) {
        double p = 1. * (a + b + c) / 2;
        return sqrt(p * (p - a) * (p - b) * (p - c));
    } else {
        return -1;
    }
}