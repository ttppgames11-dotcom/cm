import 'package:flutter/material.dart';

/// The photo attached to a community post. Tap to see it full screen.
class PostImage extends StatelessWidget {
  const PostImage({super.key, required this.url, this.maxHeight = 320});

  final String url;
  final double maxHeight;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _openFullScreen(context),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: ConstrainedBox(
          constraints: BoxConstraints(maxHeight: maxHeight),
          child: Image.network(
            url,
            width: double.infinity,
            fit: BoxFit.cover,
            loadingBuilder:
                (_, child, progress) =>
                    progress == null
                        ? child
                        : _placeholder(
                          const SizedBox.square(
                            dimension: 22,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.4,
                              color: Color(0xFFE84C10),
                            ),
                          ),
                        ),
            errorBuilder:
                (_, __, ___) => _placeholder(
                  const Icon(
                    Icons.broken_image_outlined,
                    color: Color(0xFF9CA3AF),
                    size: 30,
                  ),
                ),
          ),
        ),
      ),
    );
  }

  Widget _placeholder(Widget child) => Container(
    height: 180,
    width: double.infinity,
    color: const Color(0xFFF7F1EA),
    alignment: Alignment.center,
    child: child,
  );

  void _openFullScreen(BuildContext context) {
    Navigator.of(context, rootNavigator: true).push(
      MaterialPageRoute<void>(
        fullscreenDialog: true,
        builder:
            (_) => Scaffold(
              backgroundColor: Colors.black,
              appBar: AppBar(
                backgroundColor: Colors.black,
                foregroundColor: Colors.white,
                elevation: 0,
              ),
              body: Center(
                child: InteractiveViewer(
                  maxScale: 4,
                  child: Image.network(
                    url,
                    errorBuilder:
                        (_, __, ___) => const Icon(
                          Icons.broken_image_outlined,
                          color: Colors.white54,
                          size: 40,
                        ),
                  ),
                ),
              ),
            ),
      ),
    );
  }
}
