public class ifelse03 {
    public static void ifElseMystery(int x, int y) {
        int z = 0;
        if (x >= y) {
            x = x / 2;
            z++;
        }
        if (x > z && y <= z) {
            z++;
        } else if (x > z) {
            y = y - 5;
        }
        System.out.println(x + " " + y + " " + z);
    }
}
